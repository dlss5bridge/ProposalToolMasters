// GetOrganisationThemeSettings's themeSettings._ServicePackage is the only
// place servicePackageKeyID (as opposed to the plain servicePackageID used
// everywhere else in this flow — pricing, selection state, etc.) exists on
// the client, so the Generate Contract URL must resolve it from here rather
// than sending servicePackageID directly as the key ID.
//
// A Service-based proposal has no packages at all, so _ServicePackage comes
// back null/undefined/[] for it — that absence is also the correct signal to
// leave ServicePackageKeyID out of the Generate Contract URL entirely.
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
