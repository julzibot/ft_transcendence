import GameCountdownModal from "@/components/cards/GameStartingModal";

const players = {
    player1: {
        id: 1,
        username: 'Admin',
        image: '/media/images/0e9ef6c9-76d9-4f1f-823a-74d8268e7742.jpg'
    },
    player2: {
        id: 105641,
        username: 'Milan',
        image: '/media/images/0e9ef6c9-76d9-4f1f-823a-74d8268e7742.jpg'
    }
}

export default function Test() {
    return <GameCountdownModal players={players} show={true} />
}