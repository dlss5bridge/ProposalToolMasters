import CategoryCard from "./CategoryCard";

const OneOffServices = ({
  categories,
  selections,
  crossSelections,
  expandedIds,
  onToggleExpand,
  onToggleService,
  onDriverChange,
}) => {
  return (
    <div>
      <h2 className="pss-list-heading">One-Off / Ad Hoc Services</h2>

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
          />
        ))}

        {categories.length === 0 && (
          <p className="pss-empty-state">No one-off services match your filters.</p>
        )}
      </div>
    </div>
  );
};

export default OneOffServices;
