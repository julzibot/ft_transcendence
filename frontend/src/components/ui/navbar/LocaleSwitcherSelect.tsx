'use client';

import {useRouter} from 'next/navigation';
import {ChangeEvent, ReactNode, useTransition} from 'react';

type Props = {
  children: ReactNode;
  defaultValue: string;
  label: string;
};

export default function LocaleSwitcherSelect({
  children,
  defaultValue,
  label
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    startTransition(() => {
      router.replace(`/${nextLocale}`);
    });
  }

  return (
    <label className='m-2 p-1'>
      <p className='text-light m-1'>{label}</p>
			<div className="d-flex justify-content-center">
				<select
					defaultValue={defaultValue}
					disabled={isPending}
					onChange={onSelectChange}
				>
					{children}
				</select>
			</div>
    </label>
  );
}