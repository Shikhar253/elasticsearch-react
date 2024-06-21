import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { searchEmployees } from "../api";
import axios from "axios";

const BASE_URL = "https://localhost:9200/employee/_search";

const Search = () => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [filters, setFilters] = useState({});
  const [uniqueValues, setUniqueValues] = useState({});

  const { data, isLoading, refetch } = useQuery(
    ["search", query, page, size, filters],
    () => searchEmployees(query, page, size, filters),
    { enabled: false }
  );

  useEffect(() => {
    if (query || Object.keys(filters).length > 0) {
      refetch();
    }
  }, [page, size, query, filters, refetch]);

  useEffect(() => {
    const fetchUniqueValues = async () => {
      const response = await axios({
        method: "post",
        url: `${BASE_URL}`,
        auth: {
          username: "elastic",
          password: "EsLZx-fCPn16iARqN=Sq",
        },
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          size: 0,
          aggs: {
            unique_education: {
              terms: { field: "Education.keyword", size: 1000 },
            },
            unique_city: { terms: { field: "City.keyword", size: 1000 } },
            unique_gender: { terms: { field: "Gender.keyword", size: 1000 } },
            unique_everbenched: {
              terms: { field: "EverBenched.keyword", size: 1000 },
            },
            unique_paymenttier: { terms: { field: "PaymentTier", size: 1000 } },
            unique_leaveornot: { terms: { field: "LeaveOrNot", size: 1000 } },
          },
        },
      });
      setUniqueValues({
        education: response.data.aggregations.unique_education.buckets.map(
          (bucket) => bucket.key
        ),
        city: response.data.aggregations.unique_city.buckets.map(
          (bucket) => bucket.key
        ),
        gender: response.data.aggregations.unique_gender.buckets.map(
          (bucket) => bucket.key
        ),
        everbenched: response.data.aggregations.unique_everbenched.buckets.map(
          (bucket) => bucket.key
        ),
        paymenttier: response.data.aggregations.unique_paymenttier.buckets.map(
          (bucket) => bucket.key
        ),
        leaveornot: response.data.aggregations.unique_leaveornot.buckets.map(
          (bucket) => bucket.key
        ),
      });
    };
    fetchUniqueValues();
  }, []);

  const handleSearch = () => {
    setPage(0);
    refetch();
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const handlePageSizeChange = (e) => {
    setSize(Number(e.target.value));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      if (value === "") {
        delete newFilters[name];
      } else {
        newFilters[name] = value;
      }
      return newFilters;
    });
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({});
    setQuery("");
    setPage(0);
    refetch();
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search employees"
      />
      <button onClick={handleSearch}>Search</button>
      <button onClick={handleResetFilters}>Reset Filters</button>

      <label>
        Entries per page:
        <select value={size} onChange={handlePageSizeChange}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </label>

      <label>
        City:
        <select
          name="City"
          value={filters.City || ""}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          {uniqueValues.city?.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>

      <label>
        Education:
        <select
          name="Education"
          value={filters.Education || ""}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          {uniqueValues.education?.map((education) => (
            <option key={education} value={education}>
              {education}
            </option>
          ))}
        </select>
      </label>

      <label>
        Gender:
        <select
          name="Gender"
          value={filters.Gender || ""}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          {uniqueValues.gender?.map((gender) => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </select>
      </label>

      <label>
        Ever Benched:
        <select
          name="EverBenched"
          value={filters.EverBenched || ""}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          {uniqueValues.everbenched?.map((everbenched) => (
            <option key={everbenched} value={everbenched}>
              {everbenched}
            </option>
          ))}
        </select>
      </label>

      <label>
        Payment Tier:
        <select
          name="PaymentTier"
          value={filters.PaymentTier || ""}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          {uniqueValues.paymenttier?.map((paymenttier) => (
            <option key={paymenttier} value={paymenttier}>
              {paymenttier}
            </option>
          ))}
        </select>
      </label>

      <label>
        Leave or Not:
        <select
          name="LeaveOrNot"
          value={filters.LeaveOrNot || ""}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          {uniqueValues.leaveornot?.map((leaveornot) => (
            <option key={leaveornot} value={leaveornot}>
              {leaveornot}
            </option>
          ))}
        </select>
      </label>

      {isLoading && <p>Loading...</p>}
      <ul>
        {data &&
          data.hits.map((item) => (
            <li key={item._id}>
              {Object.entries(item._source).map(([key, value]) => (
                <span key={key}>
                  <strong>{key}:</strong> {value},{" "}
                </span>
              ))}
            </li>
          ))}
      </ul>
      <button onClick={handlePrevPage} disabled={page === 0}>
        Previous
      </button>
      <button
        onClick={handleNextPage}
        disabled={data && data.hits.length < size}
      >
        Next
      </button>
    </div>
  );
};

export default Search;
