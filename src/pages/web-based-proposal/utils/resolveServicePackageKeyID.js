// themeSettings._ServicePackage is the only place servicePackageKeyID
// exists on the client (everywhere else uses plain servicePackageID), so we
// look it up here for the Generate Contract URL. Service-based proposals
// have no packages, so this returns null and the URL param gets skipped.
export const resolveServicePackageKeyID = (themeSettings, servicePackageID) => {
  const servicePackages = themeSettings?._ServicePackage;
  if (!Array.isArray(servicePackages) || servicePackages.length === 0) {
    return null;
  }

  const matched = servicePackages.find(
    (pkg) => pkg.servicePackageID === servicePackageID,
  );
  return matched?.servicePackageKeyID ?? null;
};
