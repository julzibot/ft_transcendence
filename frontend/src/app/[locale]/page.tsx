// "use client";
// import ThreeScene from '@/components/game/Game';
import { useTranslations } from 'next-intl';


export default function Home() {
  const t = useTranslations('Index');

  return (
    <>
      {/* <ThreeScene /> */}
      <h1>{t('title')}</h1>
    </>
  )
}
