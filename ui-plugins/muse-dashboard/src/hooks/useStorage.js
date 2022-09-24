/**
 APIS:
  - getDashboardList
  - getDashboard
  - saveDashboard
  - deleteDashboard
 */

const mockData = [
  { id: 'uid1', widget: 'dashboardNote', settings: null, grid: { w: 6, x: 0, y: 0, h: 12 } },
  { id: 'uid2', widget: 'dashboardNote', settings: null, grid: { w: 6, x: 6, y: 0, h: 6 } },
  { id: 'uid3', widget: 'favoritePools', settings: null, grid: { w: 6, x: 6, y: 6, h: 6 } },
];
export default function useStorage(key, ...args) {
  return {
    data: mockData,
  };
}
