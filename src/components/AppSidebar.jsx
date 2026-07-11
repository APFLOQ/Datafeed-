import { useState, useRef, useEffect } from 'react'
import { LayoutDashboard, ArrowLeftRight, BarChart3, Calendar, Target, BookOpen, ChevronDown } from 'lucide-react'
import { $ as anime } from 'animejs'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const navItems = [
  {
    id: 'dashboard', icon: LayoutDashboard, title: 'Dashboard',
  },
  {
    id: 'trades', icon: ArrowLeftRight, title: 'Trades',
    subs: [{ id: 'trades', title: 'All Trades' }],
  },
  {
    id: 'analytics', icon: BarChart3, title: 'Analytics',
    subs: [{ id: 'analytics', title: 'Overview' }],
  },
  {
    id: 'calendar', icon: Calendar, title: 'Calendar',
  },
  {
    id: 'premarket', icon: Target, title: 'Pre-Market',
  },
  {
    id: 'playbook', icon: BookOpen, title: 'Playbook',
  },
]

function NavItem({ item, activeSection, onSectionChange }) {
  const hasSubs = item.subs && item.subs.length > 0
  const isActive = activeSection === item.id || (hasSubs && item.subs.some((s) => s.id === activeSection))
  const [open, setOpen] = useState(isActive)
  const subRef = useRef(null)
  const prevOpen = useRef(open)

  useEffect(() => {
    if (!subRef.current || !hasSubs) return
    const el = subRef.current
    const items = el.querySelectorAll('[data-sidebar="menu-sub-button"]')
    if (open && !prevOpen.current) {
      anime({
        targets: el,
        maxHeight: [0, el.scrollHeight],
        opacity: [0, 1],
        duration: 200,
        easing: 'easeOutCubic',
      })
      if (items.length) {
        anime({
          targets: items,
          translateY: [-4, 0],
          opacity: [0, 1],
          duration: 150,
          delay: anime.stagger(30),
          easing: 'easeOutCubic',
        })
      }
    }
    if (!open && prevOpen.current) {
      anime({
        targets: el,
        maxHeight: [el.scrollHeight, 0],
        opacity: [1, 0],
        duration: 150,
        easing: 'easeInCubic',
      })
    }
    prevOpen.current = open
  }, [open, hasSubs])

  const handleClick = () => {
    if (hasSubs) {
      setOpen((prev) => !prev)
    } else {
      onSectionChange(item.id)
    }
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={isActive} onClick={handleClick} tooltip={item.title}>
        <item.icon />
        <span className="flex-1 truncate">{item.title}</span>
        {hasSubs && (
          <ChevronDown
            size={14}
            className={cn(
              'ml-auto shrink-0 transition-transform duration-150 ease-out',
              open && 'rotate-180'
            )}
          />
        )}
      </SidebarMenuButton>
      {hasSubs && (
        <div ref={subRef} className="overflow-hidden" style={{ maxHeight: open ? undefined : 0, opacity: open ? 1 : 0 }}>
          <SidebarMenuSub>
            {item.subs.map((sub) => (
              <SidebarMenuSubItem key={sub.id}>
                <SidebarMenuSubButton
                  isActive={activeSection === sub.id}
                  onClick={() => onSectionChange(sub.id)}
                >
                  <span>{sub.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </div>
      )}
    </SidebarMenuItem>
  )
}

export default function AppSidebar({ activeSection, onSectionChange }) {
  const menuRef = useRef(null)

  useEffect(() => {
    if (menuRef.current) {
      const items = menuRef.current.querySelectorAll('[data-sidebar="menu-button"]')
      anime({
        targets: items,
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 300,
        delay: anime.stagger(40),
        easing: 'easeOutCubic',
      })
    }
  }, [])

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-signal-orange text-[#101010]">
                  <BarChart3 className="size-4" />
                </div>
                <span className="truncate font-['Geist',sans-serif] font-[400] text-sm tracking-tight">Datafeed</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu ref={menuRef}>
              {navItems.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  activeSection={activeSection}
                  onSectionChange={onSectionChange}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
