import CategoryCard from "./CategoryCard";

const RecurringServices = ({
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
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Recurring Services</h2>

      <div className="space-y-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.serviceCatID}
            category={category}
            selections={selections}
            crossSelections={crossSelections}
            crossLabel="One-off"
            expanded={expandedIds.has(category.serviceCatID)}
            onToggleExpand={() => onToggleExpand(category.serviceCatID)}
            onToggleService={onToggleService}
            onDriverChange={onDriverChange}
          />
        ))}

        {categories.length === 0 && (
          <p className="text-sm text-gray-400 py-6 text-center">No recurring services match your filters.</p>
        )}
      </div>
    </div>
  );
};

export default RecurringServices;
