import { useEffect, useState } from "react";
import { useMissingPerson } from "../../contexts/MissingPersonContext";

const useMissingPersonData = () => {
  const {
    missingPersons,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    loadMissingPersons,
    selectedPerson,
    setSelectedPerson,
  } = useMissingPerson();

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [currentPage, setCurrentPage] = useState(1);

  // Load on mount and when filters/page change
  useEffect(() => {
    loadMissingPersons({ page: currentPage });
  }, [filters, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return {
    missingPersons,
    loading,
    error,
    filters,
    searchInput,
    setSearchInput,
    currentPage,
    pagination,
    selectedPerson,
    setSelectedPerson,
    handleSearch,
    handleFilterChange,
    handlePageChange,
  };
};

export default useMissingPersonData;