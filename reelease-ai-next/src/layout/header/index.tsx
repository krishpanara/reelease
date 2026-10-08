import { HeaderProps } from '@/types'
import LeftHeader from './LeftHeader'
import RightHeader from './RightHeader'

const Header = ({ onMenuToggle, dir }: HeaderProps) => {
  return (
    <header dir={dir} className="rounded-border-radius bg-(--light-body) sticky top-0 z-50 transition-all duration-300 backdrop-blur-3xl">
      <div className="px-4 lg:px-8 py-6! pb-2! sm:pb-0 flex items-center justify-between ">
        <LeftHeader onMenuToggle={onMenuToggle} />
        <RightHeader />
      </div>
    </header>
  )
}

export default Header
