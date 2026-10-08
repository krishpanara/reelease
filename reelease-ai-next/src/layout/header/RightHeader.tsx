import CreditsDropdown from './CreditsDropdown'
import LanguageDropdown from './LanguageDropdown'
import ThemeDropdown from './ThemeDropdown'
import NotificationDropdown from './NotificationDropdown'
import UserDropdown from './UserDropdown'

const RightHeader = () => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 ml-0 sm:ml-4 rtl:sm:ml-0 rtl:sm:mr-3 rtl:mr-0 shrink-0">
      <CreditsDropdown />
      <LanguageDropdown />
      <ThemeDropdown /> 
      <NotificationDropdown />
      <UserDropdown />
    </div>
  )
}

export default RightHeader
