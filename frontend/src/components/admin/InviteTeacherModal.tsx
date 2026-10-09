'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
import { useAdmin } from '@/contexts/AdminContext';
import { subjectStyles } from '@/utils/subjects';
import type { Subject, Grade } from '@/types';
import { UserPlusIcon, KeyIcon, MailIcon, CheckIcon, CopyIcon, GraduationCapIcon } from 'lucide-react';


const subjects: { key: Subject; label: string }[] = [
  { key: 'math', label: 'Mathematics' },
  { key: 'science', label: 'Science' },
  { key: 'english', label: 'English & IELTS' },
  { key: 'computer', label: 'Computer Science' },
];

const fieldClass = 'h-11 w-full rounded-2xl border-2 border-line bg-white px-4 text-sm text-ink outline-none transition-colors duration-150 focus:border-ink';

interface InviteTeacherModalProps {
  open: boolean;
  onClose: () => void;
}

export function InviteTeacherModal({ open, onClose }: InviteTeacherModalProps) {
  const { createTeacher } = useAdmin();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Teacher1234!@#');
  const [subject, setSubject] = useState<Subject>('math');
  const [assignedGrade, setAssignedGrade] = useState<Grade | 0>(5);
  const [submitting, setSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; pass: string; name: string; grade?: Grade | 0 } | null>(null);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('Teacher1234!@#');
    setSubject('math');
    setAssignedGrade(5);
    setCreatedCredentials(null);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await createTeacher({
        email: email.trim(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        subject,
        assignedGrade: assignedGrade === 0 ? undefined : (assignedGrade as Grade),
      });

      setCreatedCredentials({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        pass: password,
        grade: assignedGrade,
      });
      toast.success(`Teacher account for ${firstName} created successfully!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create teacher account.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `ELARION Teacher Login Credentials:\nName: ${createdCredentials.name}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.pass}\nLogin URL: http://localhost:3001/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add New Teacher">
      {createdCredentials ? (
        <div className="space-y-6 pt-2">
          <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/70 p-5 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-lg font-black text-ink">Teacher Account Ready!</h3>
            <p className="mt-1 text-sm text-ink-soft">
              The teacher has been granted instructor access and can now log in immediately.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-line bg-surface/50 p-4 space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="font-extrabold text-ink-muted">Teacher:</span>
              <span className="font-black text-ink">{createdCredentials.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-extrabold text-ink-muted">Email:</span>
              <span className="font-black text-ink">{createdCredentials.email}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-extrabold text-ink-muted">Password:</span>
              <span className="font-black text-ink font-mono bg-white px-2 py-0.5 rounded border border-line">{createdCredentials.pass}</span>
            </div>
            {createdCredentials.grade ? (
              <div className="flex justify-between items-center text-sm">
                <span className="font-extrabold text-ink-muted">Assigned Class:</span>
                <span className="font-black text-ink bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200">Grade {createdCredentials.grade}</span>
              </div>
            ) : null}
            <div className="flex justify-between items-center text-sm">
              <span className="font-extrabold text-ink-muted">Login URL:</span>
              <span className="font-bold text-brand-600">/login</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 justify-center gap-2"
              onClick={handleCopyCredentials}
            >
              {copied ? <CheckIcon className="h-4 w-4 text-emerald-600" /> : <CopyIcon className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Credentials'}
            </Button>
            <Button
              type="button"
              className="flex-1 justify-center"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <p className="text-sm text-ink-soft">
            Provision a new teacher account directly. They will be granted Instructor permissions to manage classes and students.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wider text-ink-muted">First Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wider text-ink-muted">Last Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Miller"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wider text-ink-muted">Email Address</label>
            <div className="relative">
              <MailIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted" />
              <input
                type="email"
                required
                placeholder="teacher@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${fieldClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wider text-ink-muted">Primary Subject Area</label>
            <div className="grid grid-cols-2 gap-2">
              {subjects.map((s) => {
                const style = subjectStyles[s.key];
                const active = subject === s.key;
                const IconComponent = style.icon;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSubject(s.key)}
                    className={`flex items-center gap-2 rounded-2xl border-2 p-3 text-left transition-all ${
                      active ? 'border-ink bg-surface shadow-sm' : 'border-line hover:border-ink/30 bg-white'
                    }`}
                  >
                    <span className={`grid h-7 w-7 place-items-center rounded-xl text-xs font-black ${style.soft} ${style.text}`}>
                      <IconComponent className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-xs font-extrabold text-ink">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-black uppercase tracking-wider text-ink-muted">
                Assign Class / Grade Level
              </label>
              <span className="text-[11px] font-bold text-ink-muted">Optional (can assign later)</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => setAssignedGrade(0)}
                className={`rounded-2xl border-2 py-2.5 text-center text-xs font-black transition-all ${
                  assignedGrade === 0
                    ? 'border-ink bg-surface shadow-sm text-ink'
                    : 'border-line hover:border-ink/30 bg-white text-ink-muted'
                }`}
              >
                None
              </button>
              {([1, 2, 3, 4, 5] as Grade[]).map((g) => {
                const active = assignedGrade === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setAssignedGrade(g)}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 py-2 text-center transition-all ${
                      active
                        ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-line hover:border-ink/30 bg-white text-ink'
                    }`}
                  >
                    <span className="text-xs font-black">Grade {g}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wider text-ink-muted">Initial Password</label>
            <div className="relative">
              <KeyIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted" />
              <input
                type="text"
                required
                placeholder="Initial password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${fieldClass} pl-10 font-mono`}
              />
            </div>
            <p className="mt-1 text-[11px] text-ink-muted">
              Must be at least 10 chars with uppercase, lowercase, digit, and symbol.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              <UserPlusIcon className="h-4 w-4" />
              {submitting ? 'Creating Teacher...' : 'Add Teacher'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
