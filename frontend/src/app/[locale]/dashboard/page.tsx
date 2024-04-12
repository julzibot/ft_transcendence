import { useTranslations } from "next-intl";
import "./styles.css";
import UserDashboardCard from '../../../components/ui/dashboard/UserDashboardCard'

export default function Dashboard() {
	const t = useTranslations('Index');
	
	return (
		<>
			<UserDashboardCard />
		</>
	)
}