'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { useAdmin } from '@/contexts/AdminContext';
import { teachers } from '@/data/admin';
import { adminApi } from '@/utils/adminApi';
import { useRouter } from 'next/navigation';
import { subjectStyles } from '@/utils/subjects';
import type { Grade, Subject } from '@/types';
import { PlusIcon, Trash2Icon, UploadIcon, VideoIcon, FileTextIcon, ImageIcon, LayersIcon } from 'lucide-react';

const fieldClass = 'h-11 w-full rounded-2xl border-2 border-line bg-white px-4 text-sm text-ink outline-none transition-colors duration-150 focus:border-ink';
const subjects: Subject[] = ['math', 'science', 'english', 'computer'];
const grades: Grade[] = [1, 2, 3, 4, 5];

interface DraftLesson {
  id: string;
  title: string;
  bodyMarkdown: string;
  videoFile?: File | null;
  videoName?: string;
  docFile?: File | null;
  docName?: string;
}

interface DraftModule {
  id: string;
  title: string;
  description: string;
  lessons: DraftLesson[];
}

export function CreateCourseModal({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { createCourse } = useAdmin();
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState<Grade>(5);
  const [subject, setSubject] = useState<Subject>('science');
  const [description, setDescription] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [publish, setPublish] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Dynamic modules builder
  const [modules, setModules] = useState<DraftModule[]>([
    {
      id: 'mod-1',
      title: 'Module 1: Introduction & Fundamentals',
      description: 'Foundational concepts and overview',
      lessons: [
        { id: 'les-1', title: 'Lesson 1: Core Concepts', bodyMarkdown: 'Welcome to this lesson! Explore the foundational principles.' },
        { id: 'les-2', title: 'Lesson 2: Guided Practice', bodyMarkdown: 'Let us practice applying the concepts learned.' },
      ],
    },
  ]);

  const [activeTab, setActiveTab] = useState<'details' | 'curriculum' | 'media'>('details');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setGrade(5);
      setSubject('science');
      setTeacherId('');
      setPublish(true);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setModules([
        {
          id: 'mod-1',
          title: 'Module 1: Introduction & Fundamentals',
          description: 'Foundational concepts and overview',
          lessons: [
            { id: 'les-1', title: 'Lesson 1: Core Concepts', bodyMarkdown: 'Welcome to this lesson! Explore the foundational principles.' },
            { id: 'les-2', title: 'Lesson 2: Guided Practice', bodyMarkdown: 'Let us practice applying the concepts learned.' },
          ],
        },
      ]);
      setActiveTab('details');
      setError(null);
    }
  }, [open]);

  const eligible = teachers.filter((t) => t.subject === subject);

  const handleAddModule = () => {
    const num = modules.length + 1;
    setModules([
      ...modules,
      {
        id: `mod-${Date.now()}`,
        title: `Module ${num}: Advanced Concepts`,
        description: 'Deeper dive and mastery topics',
        lessons: [{ id: `les-${Date.now()}`, title: `Lesson 1: Deep Dive`, bodyMarkdown: 'In-depth exploration.' }],
      },
    ]);
  };

  const handleRemoveModule = (modId: string) => {
    if (modules.length <= 1) {
      toast.error('A course needs at least one module');
      return;
    }
    setModules(modules.filter((m) => m.id !== modId));
  };

  const handleAddLesson = (modId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id !== modId) return m;
        const num = m.lessons.length + 1;
        return {
          ...m,
          lessons: [
            ...m.lessons,
            { id: `les-${Date.now()}-${num}`, title: `Lesson ${num}: New Topic`, bodyMarkdown: 'Lesson explanation and exercises.' },
          ],
        };
      })
    );
  };

  const handleRemoveLesson = (modId: string, lesId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id !== modId) return m;
        if (m.lessons.length <= 1) {
          toast.error('Each module requires at least one lesson');
          return m;
        }
        return {
          ...m,
          lessons: m.lessons.filter((l) => l.id !== lesId),
        };
      })
    );
  };

  const handleUpdateLesson = (modId: string, lesId: string, field: keyof DraftLesson, val: any) => {
    setModules(
      modules.map((m) => {
        if (m.id !== modId) return m;
        return {
          ...m,
          lessons: m.lessons.map((l) => (l.id === lesId ? { ...l, [field]: val } : l)),
        };
      })
    );
  };

  const handleThumbnailChange = (file: File) => {
    setThumbnailFile(file);
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError('Please enter a course title');
    if (!description.trim()) return setError('Please provide a course description');
    setIsSubmitting(true);
    setSubmitStep('Creating course…');
    setError(null);

    try {
      // 1. Create Course in Backend DB
      const baseSlug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const slug = `${subject}-${baseSlug}-${Date.now().toString().slice(-4)}`;
      const res = await adminApi.createCourse({
        title: title.trim(),
        grade,
        description: description.trim(),
        slug,
      });

      const newCourseId = res?.id;

      if (newCourseId) {
        // 2. Upload course thumbnail if provided
        if (thumbnailFile) {
          setSubmitStep('Uploading thumbnail…');
          try {
            await adminApi.directUpload(newCourseId, thumbnailFile, 'course_thumbnail');
          } catch (uploadErr) {
            console.warn('Thumbnail direct upload failed, trying presign fallback:', uploadErr);
            try {
              const presign = await adminApi.requestPresignedUpload(newCourseId, {
                media_type: 'course_thumbnail',
                filename: thumbnailFile.name,
                content_type: thumbnailFile.type,
                size_bytes: thumbnailFile.size,
              });

              await fetch(presign.presigned_url, {
                method: 'PUT',
                headers: { 'Content-Type': thumbnailFile.type },
                body: thumbnailFile,
              });

              await adminApi.confirmUpload(newCourseId, presign.upload_id, {
                media_type: 'course_thumbnail',
              });
            } catch (fallbackErr) {
              console.warn('Thumbnail upload fallback warning:', fallbackErr);
            }
          }
        }

        // 3. Create all Modules and Lessons in DB
        for (let mIdx = 0; mIdx < modules.length; mIdx++) {
          const mod = modules[mIdx];
          setSubmitStep(`Creating module ${mIdx + 1} of ${modules.length}…`);
          const modRes = await adminApi.createModule(newCourseId, {
            title: mod.title.trim() || `Module ${mIdx + 1}`,
            sequence_order: mIdx + 1,
            description: mod.description.trim() || undefined,
          });

          for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
            const les = mod.lessons[lIdx];
            setSubmitStep(`Creating lesson ${lIdx + 1} of ${mod.lessons.length}…`);
            const lesRes = await adminApi.createLesson(modRes.id, {
              title: les.title.trim() || `Lesson ${lIdx + 1}`,
              sequence_order: lIdx + 1,
            });

            // Update body markdown and upload attached video if present
            await adminApi.updateLesson(lesRes.id, {
              body_markdown: les.bodyMarkdown?.trim() || `Welcome to ${les.title}! Explore core principles and key insights.`,
            });

            if (les.videoFile) {
              setSubmitStep(`Uploading video for lesson ${lIdx + 1}…`);
              try {
                await adminApi.directUpload(newCourseId, les.videoFile, 'lesson_video', lesRes.id);
              } catch (vErr) {
                console.warn('Lesson video direct upload failed, trying presign fallback:', vErr);
                try {
                  const vPresign = await adminApi.requestPresignedUpload(newCourseId, {
                    lesson_id: lesRes.id,
                    media_type: 'lesson_video',
                    filename: les.videoFile.name,
                    content_type: les.videoFile.type,
                    size_bytes: les.videoFile.size,
                  });

                  await fetch(vPresign.presigned_url, {
                    method: 'PUT',
                    headers: { 'Content-Type': les.videoFile.type },
                    body: les.videoFile,
                  });

                  await adminApi.confirmUpload(newCourseId, vPresign.upload_id, {
                    lesson_id: lesRes.id,
                    media_type: 'lesson_video',
                  });
                } catch (fallbackVErr) {
                  console.warn('Lesson video upload fallback warning:', fallbackVErr);
                }
              }
            }
            if (publish) {
              await adminApi.publishLesson(lesRes.id).catch(() => {});
            }
          }
        }

        // 4. Publish course if selected
        if (publish) {
          await adminApi.publishCourse(newCourseId).catch(() => {});
        }
      }

      // 5. Update local context
      createCourse({
        title: title.trim(),
        grade,
        subject,
        teacherId: teacherId || null,
        status: publish ? 'published' : 'draft',
      });

      const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
      toast.success(`${title.trim()} created with ${modules.length} modules and ${totalLessons} lessons!`);
      onClose();

      if (newCourseId) {
        router.push(`/admin/courses/${newCourseId}/builder`);
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to create course';
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('token')) {
        toast.error('Session expired. Please sign in again as Admin.');
        setError('Your login session has expired. Please sign in again as Admin to continue.');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        toast.error(msg);
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Course & Curriculum"
      description="Add course details, upload cover thumbnails and videos, and structure curriculum modules."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex border-b border-line gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 px-3 text-sm font-extrabold border-b-2 transition-colors ${
              activeTab === 'details' ? 'border-ink text-ink' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            1. Course Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`pb-2.5 px-3 text-sm font-extrabold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'curriculum' ? 'border-ink text-ink' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <LayersIcon className="h-4 w-4" /> 2. Modules & Lessons ({modules.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`pb-2.5 px-3 text-sm font-extrabold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'media' ? 'border-ink text-ink' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <ImageIcon className="h-4 w-4" /> 3. Media & Uploads
          </button>
        </div>

        {/* TAB 1: DETAILS */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="course-title" className="mb-1 block text-sm font-bold text-ink">Course title *</label>
              <input
                id="course-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Solar System & Planetary Science"
                className={fieldClass}
                aria-invalid={!!error}
              />
            </div>

            <div>
              <label htmlFor="course-desc" className="mb-1 block text-sm font-bold text-ink">Course description *</label>
              <textarea
                id="course-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Explore planets, stars, asteroid belts, and physical forces in our universe."
                rows={2}
                className="w-full rounded-2xl border-2 border-line bg-white p-3 text-sm text-ink outline-none transition-colors duration-150 focus:border-ink resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="course-grade" className="mb-1 block text-sm font-bold text-ink">Grade *</label>
                <select id="course-grade" value={grade} onChange={(e) => setGrade(Number(e.target.value) as Grade)} className={fieldClass}>
                  {grades.map((g) => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="course-subject" className="mb-1 block text-sm font-bold text-ink">Subject *</label>
                <select
                  id="course-subject"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value as Subject);
                    setTeacherId('');
                  }}
                  className={fieldClass}
                >
                  {subjects.map((s) => <option key={s} value={s}>{subjectStyles[s].label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="course-teacher" className="mb-1 block text-sm font-bold text-ink">Assign Teacher</label>
              <select id="course-teacher" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className={fieldClass}>
                <option value="">Assign later</option>
                {eligible.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-surface p-3.5">
              <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="h-5 w-5 accent-[#16181D]" />
              <span>
                <span className="block text-sm font-extrabold text-ink">Publish immediately</span>
                <span className="block text-xs text-ink-muted">Students in Grade {grade} can start learning as soon as created.</span>
              </span>
            </label>
          </div>
        )}

        {/* TAB 2: MODULES & LESSONS */}
        {activeTab === 'curriculum' && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">Curriculum Structure</p>
              <Button size="sm" variant="secondary" onClick={handleAddModule}>
                <PlusIcon className="h-3.5 w-3.5 mr-1" /> Add Module
              </Button>
            </div>

            {modules.map((m, mIdx) => (
              <div key={m.id} className="rounded-2xl border-2 border-line bg-surface p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <input
                    value={m.title}
                    onChange={(e) => {
                      const updated = [...modules];
                      updated[mIdx].title = e.target.value;
                      setModules(updated);
                    }}
                    placeholder={`Module ${mIdx + 1} Title`}
                    className="h-10 flex-1 rounded-xl border border-line bg-white px-3 text-sm font-bold text-ink outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveModule(m.id)}
                    className="p-2 text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                    title="Delete Module"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2 pl-2 border-l-2 border-line">
                  <p className="text-xs font-bold text-ink-muted">Lessons in this module:</p>
                  {m.lessons.map((l, lIdx) => (
                    <div key={l.id} className="rounded-xl border border-line bg-white p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          value={l.title}
                          onChange={(e) => handleUpdateLesson(m.id, l.id, 'title', e.target.value)}
                          placeholder={`Lesson ${lIdx + 1} Title`}
                          className="h-9 flex-1 rounded-lg border border-line bg-surface px-3 text-xs font-extrabold text-ink outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveLesson(m.id, l.id)}
                          className="p-1.5 text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                          title="Remove Lesson"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <textarea
                        value={l.bodyMarkdown}
                        onChange={(e) => handleUpdateLesson(m.id, l.id, 'bodyMarkdown', e.target.value)}
                        placeholder="Lesson notes, explanation, or reading documentation (Markdown supported)..."
                        rows={2}
                        className="w-full rounded-lg border border-line bg-surface p-2 text-xs text-ink outline-none resize-none"
                      />

                      {/* Lesson Video File Selector */}
                      <div className="flex items-center gap-2 pt-1">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1 text-xs font-bold text-ink hover:bg-line border border-line">
                          <VideoIcon className="h-3.5 w-3.5 text-brand-600" />
                          <span>{l.videoName ? l.videoName : 'Attach Video (MP4)'}</span>
                          <input
                            type="file"
                            accept="video/mp4,video/webm"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                handleUpdateLesson(m.id, l.id, 'videoFile', f);
                                handleUpdateLesson(m.id, l.id, 'videoName', f.name);
                              }
                            }}
                          />
                        </label>
                        {!l.videoFile && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2 py-1 text-xs font-bold text-amber-700">
                            ⚠ No video — students will see text only
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button size="sm" variant="ghost" onClick={() => handleAddLesson(m.id)} className="w-full justify-center">
                    <PlusIcon className="h-3.5 w-3.5 mr-1" /> Add Lesson to Module {mIdx + 1}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: MEDIA & UPLOADS */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            {/* 1. Course Cover Thumbnail */}
            <div>
              <label className="mb-1 block text-sm font-bold text-ink">Course Cover Thumbnail</label>
              <div className="rounded-2xl border-2 border-dashed border-line p-5 text-center bg-surface space-y-3">
                {thumbnailPreview ? (
                  <div className="relative mx-auto w-48 aspect-[16/9] rounded-xl overflow-hidden border-2 border-line">
                    <img src={thumbnailPreview} alt="Course preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-xs">
                    <ImageIcon className="h-6 w-6 text-ink-muted" />
                  </div>
                )}

                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-xs font-black text-white hover:bg-ink/90">
                    <UploadIcon className="h-4 w-4" />
                    <span>{thumbnailFile ? 'Change Thumbnail' : 'Upload Cover Image'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleThumbnailChange(f);
                      }}
                    />
                  </label>
                  <p className="mt-1.5 text-xs text-ink-muted">PNG, JPG, or WEBP (16:9 recommended)</p>
                </div>
              </div>
            </div>

            {/* Lesson Documentation Notice */}
            <div className="rounded-2xl border-2 border-line bg-surface p-4">
              <div className="flex items-start gap-3">
                <FileTextIcon className="h-5 w-5 text-brand-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-ink">Lesson Videos & Documentation</p>
                  <p className="text-xs text-ink-soft">
                    You can attach dedicated lesson videos and write Markdown lecture notes for each lesson in the <strong>Curriculum</strong> tab.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && <p role="alert" className="text-sm font-semibold text-danger-700">{error}</p>}

        <div className="flex justify-between items-center border-t border-line pt-3">
          <div className="flex gap-2">
            {activeTab !== 'details' && (
              <Button
                variant="ghost"
                type="button"
                onClick={() => setActiveTab(activeTab === 'media' ? 'curriculum' : 'details')}
              >
                Previous
              </Button>
            )}
            {activeTab !== 'media' && (
              <Button
                variant="secondary"
                type="button"
                onClick={() => setActiveTab(activeTab === 'details' ? 'curriculum' : 'media')}
              >
                Next
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? submitStep || 'Creating Course...' : 'Create Course'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}