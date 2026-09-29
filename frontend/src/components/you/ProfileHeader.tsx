import React from 'react';
import { Grade } from '../../types/learning';

export function ProfileHeader({ name, grade }: {name: string;grade: Grade;}) {
  return (
    <header className="flex items-center gap-4">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-xl font-semibold text-white" aria-hidden="true">
        {name.charAt(0)}
      </span>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
        <p className="text-muted">Grade {grade}</p>
      </div>
    </header>);

}