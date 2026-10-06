    async def test_generate_assessment_openblas(self, client: AsyncClient, seeded_db: AsyncSession):
        token = await self._setup_student(client, "gen_teacher@test.com")
        await seeded_db.execute(text("INSERT INTO user_roles (user_id, role_id) SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'gen_teacher@test.com' AND r.name = 'Instructor' ON CONFLICT DO NOTHING"))
        await seeded_db.commit()
        lesson, _ = await self._seed_lesson_with_assessment(seeded_db)
        
        resp = await client.post(
            "/api/v1/assessments/generate",
            headers={"Authorization": f"Bearer {token}"},
            json={"lesson_id": str(lesson.id), "is_focused_retest": False, "target_weakness_flags": []}
        )
        print("GENERATE STATUS:", resp.status_code)
        print("GENERATE BODY:", resp.json())
        assert resp.status_code == 200

