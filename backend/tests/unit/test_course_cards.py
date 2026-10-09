"""Projected read SQL fixtures and route scope tests; no live database writes."""
import unittest
import uuid
from unittest.mock import AsyncMock, patch
from types import SimpleNamespace
from sqlalchemy import create_engine, event, text
import app.main  # register existing model mappings
from app.modules.module2_content.services.course_service import list_course_cards
from app.modules.module2_content import router
from app.shared.pagination import PaginationParams

A, B, OWNER, OTHER, STUDENT = [uuid.UUID(int=n) for n in range(1, 6)]
M1, M2, L1, L2, L3 = [uuid.UUID(int=n) for n in range(11, 16)]

class CourseCardQueryTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.engine = create_engine('sqlite://')
        self.conn = self.engine.connect()
        self.conn.execute(text('CREATE TABLE courses (id CHAR(32), instructor_id CHAR(32), title TEXT, slug TEXT, description TEXT, grade INTEGER, status TEXT, thumbnail_url TEXT, thumbnail_object_key TEXT, created_at TEXT)'))
        self.conn.execute(text('CREATE TABLE course_modules (id CHAR(32), course_id CHAR(32), sequence_order INTEGER)'))
        self.conn.execute(text('CREATE TABLE lessons (id CHAR(32), module_id CHAR(32), sequence_order INTEGER, estimated_minutes INTEGER, status TEXT)'))
        self.conn.execute(text('CREATE TABLE student_progress (student_id CHAR(32), lesson_id CHAR(32), completed BOOLEAN)'))
        for cid, owner, grade, status in [(A,OWNER,3,'published'),(B,OTHER,4,'draft')]:
            self.conn.execute(text('INSERT INTO courses VALUES (:id,:owner,"Title","slug","Description",:grade,:status,NULL,NULL,"2026-01-01")'),dict(id=cid.hex,owner=owner.hex,grade=grade,status=status))
        for mid,cid,pos in [(M1,A,2),(M2,A,1)]:
            self.conn.execute(text('INSERT INTO course_modules VALUES (:m,:c,:p)'),dict(m=mid.hex,c=cid.hex,p=pos))
        for lid,mid,pos,minutes,status in [(L1,M1,1,10,'published'),(L2,M2,1,None,'published'),(L3,M2,2,99,'draft')]:
            self.conn.execute(text('INSERT INTO lessons VALUES (:id,:m,:p,:minutes,:status)'),dict(id=lid.hex,m=mid.hex,p=pos,minutes=minutes,status=status))
        for student,lid in [(STUDENT,L2),(OTHER,L1)]:
            self.conn.execute(text('INSERT INTO student_progress VALUES (:s,:l,true)'),dict(s=student.hex,l=lid.hex))
        self.statements=[]
        event.listen(self.engine,'before_cursor_execute',lambda conn,cursor,statement,*args:self.statements.append(statement))
        class DB:
            async def execute(_, query): return self.conn.execute(query)
        self.db=DB()

    def tearDown(self):
        self.conn.close(); self.engine.dispose()

    async def test_student_card_sql_counts_order_minutes_and_scoped_completion(self):
        cards,total=await list_course_cards(self.db,PaginationParams(page=1,page_size=100),status_filter='published',grade=3,student_id=STUDENT)
        self.assertEqual(total,1); self.assertEqual([c['id'] for c in cards],[A])
        self.assertEqual(cards[0]['lessons'],[{'id':L2,'minutes':5,'completed':True},{'id':L1,'minutes':10,'completed':False}])
        self.assertEqual(len(self.statements),3)
        sql=' '.join(self.statements)
        for forbidden in ['body_markdown','lesson_skills','content_assets','video_url']:
            self.assertNotIn(forbidden,sql)

    async def test_empty_course_page_has_no_lesson_query(self):
        cards,total=await list_course_cards(self.db,PaginationParams(page=2,page_size=1),status_filter='published')
        self.assertEqual(cards,[]); self.assertEqual(total,1); self.assertEqual(len(self.statements),2)

    async def test_wrong_grade_has_no_courses(self):
        cards,total=await list_course_cards(self.db,PaginationParams(),status_filter='published',grade=5)
        self.assertEqual((cards,total),([],0))

    async def test_owner_and_admin_see_draft_lessons(self):
        for kwargs in [dict(instructor_id=OWNER,staff_viewer_id=OWNER),dict(is_admin=True)]:
            cards,total=await list_course_cards(self.db,PaginationParams(),**kwargs)
            card=next(c for c in cards if c['id']==A)
            self.assertEqual([l['id'] for l in card['lessons']],[L2,L3,L1])

    async def test_public_completion_is_never_some_other_students(self):
        cards,_=await list_course_cards(self.db,PaginationParams(),status_filter='published')
        self.assertTrue(all(not l['completed'] for c in cards for l in c['lessons']))

    async def test_instructor_owner_scope(self):
        cards,total=await list_course_cards(self.db,PaginationParams(),instructor_id=OTHER,staff_viewer_id=OTHER)
        self.assertEqual([c['id'] for c in cards],[B]); self.assertEqual(total,1); self.assertEqual(cards[0]['lessons'],[])

class CourseCardRouteTests(unittest.IsolatedAsyncioTestCase):
    async def scope(self,roles,grade=3):
        user=SimpleNamespace(id=STUDENT,grade=grade,has_role=lambda role:role in roles) if roles is not None else None
        with patch.object(router.course_service,'list_course_cards',AsyncMock(return_value=([],0))) as service:
            result=await router.list_course_cards(current_user=user,db=object(),page=1,page_size=100,status_filter='draft',grade=5)
            return service,result

    async def test_student_request_cannot_override_grade_or_published(self):
        service,_=await self.scope(['Student'])
        kw=service.call_args.kwargs
        self.assertEqual(kw['grade'],3);self.assertEqual(kw['status_filter'],'published');self.assertEqual(kw['student_id'],STUDENT)

    async def test_student_without_grade_returns_empty_without_query(self):
        service,result=await self.scope(['Student'],None)
        service.assert_not_awaited();self.assertEqual(result.items,[])

    async def test_public_only_published_no_progress(self):
        service,_=await self.scope(None)
        self.assertEqual(service.call_args.kwargs['status_filter'],'published');self.assertIsNone(service.call_args.kwargs['student_id'])

    async def test_instructor_only_own_courses(self):
        service,_=await self.scope(['Instructor'])
        self.assertEqual(service.call_args.kwargs['instructor_id'],STUDENT)

    async def test_admin_retains_requested_filters(self):
        service,_=await self.scope(['Admin','Student'])
        kw=service.call_args.kwargs
        self.assertTrue(kw['is_admin']);self.assertEqual(kw['grade'],5);self.assertEqual(kw['status_filter'],'draft');self.assertIsNone(kw['instructor_id'])

if __name__ == '__main__': unittest.main()
