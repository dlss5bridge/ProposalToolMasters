import CategoryCard from "./CategoryCard";

const OneOffServices = ({
  categories,
  selections,
  crossSelections,
  expandedIds,
  onToggleExpand,
  onToggleService,
  onDriverChange,
  fieldErrors,
}) => {
  return (
    <div className="pss-list-card">
      <div className="pss-list-card-header">
        <h2 className="pss-list-heading">One-Off / Ad Hoc Services</h2>
      </div>

      <div className="pss-list-card-body">
        <div className="pss-list-stack">
          {categories.map((category) => (
            <CategoryCard
              key={category.serviceCatID}
              category={category}
              selections={selections}
              crossSelections={crossSelections}
              crossLabel="Recurring"
              expanded={expandedIds.has(category.serviceCatID)}
              onToggleExpand={() => onToggleExpand(category.serviceCatID)}
              onToggleService={onToggleService}
              onDriverChange={onDriverChange}
              fieldErrors={fieldErrors}
            />
          ))}

          {categories.length === 0 && (
            <p className="pss-empty-state">
              No one-off services match your filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OneOffServices;
