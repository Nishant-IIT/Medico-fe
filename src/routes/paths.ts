// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    admin: `${ROOTS.DASHBOARD}/admin`,
    teacher: `${ROOTS.DASHBOARD}/teacher`,
    student: `${ROOTS.DASHBOARD}/student`,
    simulation: {
      root: `${ROOTS.DASHBOARD}/student/simulation`,
      attempt: (id: string) => `${ROOTS.DASHBOARD}/student/simulation/${id}`,
    },
    history: {
      root: `${ROOTS.DASHBOARD}/student/history`,
      attempt: (id: string) => `${ROOTS.DASHBOARD}/student/history/${id}`,
    },
    physioSimulation: {
      root: `${ROOTS.DASHBOARD}/student/physio-simulation`,
      attempt: (id: string) => `${ROOTS.DASHBOARD}/student/physio-simulation/${id}`,
    },
    physioHistory: {
      root: `${ROOTS.DASHBOARD}/student/physio-history`,
      attempt: (id: string) => `${ROOTS.DASHBOARD}/student/physio-history/${id}`,
    },
    scenarios: {
      teacher: `${ROOTS.DASHBOARD}/teacher/scenarios`,
      admin: `${ROOTS.DASHBOARD}/admin/scenarios`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      students: `${ROOTS.DASHBOARD}/user/students`,
    },
    one: `${ROOTS.DASHBOARD}/one`,
    two: `${ROOTS.DASHBOARD}/two`,
    three: `${ROOTS.DASHBOARD}/three`,
    group: {
      root: `${ROOTS.DASHBOARD}/group`,
      five: `${ROOTS.DASHBOARD}/group/five`,
      six: `${ROOTS.DASHBOARD}/group/six`,
    },
  },
};
