export function isUserLoggedIn() {
  const rawUserId = localStorage.getItem("voyexa_user_id");
  return rawUserId !== null && !Number.isNaN(Number(rawUserId));
}

export function navigateRequiringLogin(navigate, targetPath, state = undefined) {
  if (isUserLoggedIn()) {
    navigate(targetPath, state ? { state } : undefined);
    return;
  }

  navigate("/auth", {
    state: {
      loginRequired: true,
      requestedPath: targetPath,
      requestedState: state,
    },
  });
}
