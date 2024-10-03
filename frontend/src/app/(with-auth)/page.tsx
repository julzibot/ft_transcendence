import GameCard from '@/components/cards/GameCard';


export default function Home() {


  return (
    <>
      <div className="d-flex flex-row justify-content-center mt-5 pt-5">
        <GameCard src="/pong.mov" />
      </div>
    </>
  )
}
