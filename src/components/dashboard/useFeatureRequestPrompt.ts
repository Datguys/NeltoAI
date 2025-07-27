import { useEffect, useState } from 'react';

// Returns [open, handleClose]
export function useFeatureRequestPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only show for signed-in users, but this hook is UI-agnostic
    const visits = parseInt(localStorage.getItem('dashboardVisits') || '0', 10) + 1;
    localStorage.setItem('dashboardVisits', visits.toString());
    // Show on 5th and 7th visit only (not again after)
    if (visits === 5 || visits === 7) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => setOpen(false);

  return [open, handleClose] as const;
}
