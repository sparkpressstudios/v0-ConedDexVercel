import {
  Award,
  Bell,
  BookOpen,
  ChevronDown,
  Compass,
  Heart,
  IceCream,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  PlusCircle,
  Search,
  Settings,
  Shield,
  Star,
  Store,
  Trophy,
  User,
  Users,
  X,
  BarChart,
  Megaphone,
  type LucideIcon,
  type LightbulbIcon as LucideProps,
} from "lucide-react"

export type Icon = LucideIcon

export const Icons = {
  logo: IceCream,
  close: X,
  spinner: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  iceCream: IceCream,
  layoutDashboard: LayoutDashboard,
  store: Store,
  users: Users,
  award: Award,
  settings: Settings,
  heart: Heart,
  bell: Bell,
  menu: Menu,
  barChart: BarChart,
  megaphone: Megaphone,
  trophy: Trophy,
  search: Search,
  user: User,
  logOut: LogOut,
  chevronDown: ChevronDown,
  plusCircle: PlusCircle,
  bookOpen: BookOpen,
  mapPin: MapPin,
  star: Star,
  shield: Shield,
  compass: Compass,
}
