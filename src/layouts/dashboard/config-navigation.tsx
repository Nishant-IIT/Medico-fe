import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// components
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: 'overview',
        items: [
          {
            title: 'Admin dashboard',
            path: paths.dashboard.admin,
            icon: ICONS.dashboard,
            roles: ['admin'],
          },
          {
            title: 'Teacher dashboard',
            path: paths.dashboard.teacher,
            icon: ICONS.dashboard,
            roles: ['teacher'],
          },
          {
            title: 'Student dashboard',
            path: paths.dashboard.student,
            icon: ICONS.dashboard,
            roles: ['student'],
          },
          { title: 'two', path: paths.dashboard.two, icon: ICONS.ecommerce },
          {
            title: 'three',
            path: paths.dashboard.three,
            icon: ICONS.analytics,
          },
        ],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: 'management',
        items: [
          {
            title: 'Users',
            path: paths.dashboard.user.list,
            icon: ICONS.user,
            roles: ['admin'],
          },
          {
            title: 'Students',
            path: paths.dashboard.user.students,
            icon: ICONS.user,
            roles: ['teacher'],
          },
          {
            title: 'My cases',
            path: paths.dashboard.scenarios.teacher,
            icon: ICONS.folder,
            roles: ['teacher'],
          },
          {
            title: 'Case management',
            path: paths.dashboard.scenarios.admin,
            icon: ICONS.folder,
            roles: ['admin'],
          },
        ],
      },

      // PATIENT SIMULATION
      // ----------------------------------------------------------------------
      {
        subheader: 'simulation',
        items: [
          {
            title: 'New case',
            path: paths.dashboard.simulation.root,
            icon: ICONS.chat,
            roles: ['student'],
          },
          {
            title: 'My history',
            path: paths.dashboard.history.root,
            icon: ICONS.folder,
            roles: ['student'],
          },
        ],
      },

      // PHYSIOTHERAPY SIMULATION
      // ----------------------------------------------------------------------
      {
        subheader: 'physiotherapy',
        items: [
          {
            title: 'New physio case',
            path: paths.dashboard.physioSimulation.root,
            icon: ICONS.chat,
            roles: ['student'],
          },
          {
            title: 'My physio history',
            path: paths.dashboard.physioHistory.root,
            icon: ICONS.folder,
            roles: ['student'],
          },
        ],
      },
    ],
    []
  );

  return data;
}
