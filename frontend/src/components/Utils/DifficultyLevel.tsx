import { EmojiHeartEyesFill, EmojiSunglassesFill, EmojiGrinFill, EmojiNeutralFill, EmojiAstonishedFill, EmojiSurpriseFill, EmojiDizzyFill } from "react-bootstrap-icons";
import { CustomTooltip } from "./Tooltip";

export default function DifficultyLevel(level: number) {
	const emojiSelector = (level: number) => {
		switch (level) {
			case 1:
				return (
					<CustomTooltip text="Granny" position="top">
						<EmojiHeartEyesFill color="green" />
					</CustomTooltip>
				)
			case 2:
				return (
					<CustomTooltip text="Boring" position="top">
						<EmojiSunglassesFill color="green" />
					</CustomTooltip>
				)
			case 3:
				return (
					<CustomTooltip text="Still Slow" position="top">
						<EmojiGrinFill color="green" />
					</CustomTooltip>
				)
			case 4:
				return (
					<CustomTooltip text="Kinda Ok" position="top">
						<EmojiNeutralFill color="orange" />
					</CustomTooltip>
				)
			case 5:
				return (
					<CustomTooltip text="Now We Are Talking" position="top">
						<EmojiAstonishedFill color="orange" />
					</CustomTooltip>
				)
			case 6:
				return (
					<CustomTooltip text="Madman" position="top">
						<EmojiSurpriseFill color="red" />
					</CustomTooltip>
				)
			case 7:
				return (
					<CustomTooltip text="Legend" position="top">
						<EmojiDizzyFill color="red" />
					</CustomTooltip>
				)
		}
	}


	return (
		<>
			{emojiSelector(level)}
		</>
	)
}