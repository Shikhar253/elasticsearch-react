import axios from "axios";

const BASE_URL = "https://localhost:9200/employee/_search";

const isNumeric = (str) => {
  if (typeof str !== "string") return false;
  return !isNaN(str) && !isNaN(parseFloat(str)); // ensure strings of whitespace fail
};

export const searchEmployees = async (
  query,
  page = 0,
  size = 10,
  filters = {}
) => {
  try {
    const lowerCaseQuery = query.toLowerCase();

    const shouldQueries = [
      {
        wildcard: {
          Education: `*${lowerCaseQuery}*`,
        },
      },
      {
        match_phrase: {
          "Education.keyword": lowerCaseQuery,
        },
      },
      {
        wildcard: {
          City: `*${lowerCaseQuery}*`,
        },
      },
      {
        match_phrase: {
          "City.keyword": lowerCaseQuery,
        },
      },
      {
        wildcard: {
          Gender: `*${lowerCaseQuery}*`,
        },
      },
      {
        match_phrase: {
          "Gender.keyword": lowerCaseQuery,
        },
      },
      {
        wildcard: {
          EverBenched: `*${lowerCaseQuery}*`,
        },
      },
    ];

    // for numeric query
    if (isNumeric(lowerCaseQuery)) {
      shouldQueries.push(
        {
          match: {
            ExperienceInCurrentDomain: lowerCaseQuery,
          },
        },
        {
          match: {
            JoiningYear: lowerCaseQuery,
          },
        },
        {
          match: {
            PaymentTier: lowerCaseQuery,
          },
        },
        {
          match: {
            Age: lowerCaseQuery,
          },
        },
        {
          match: {
            LeaveOrNot: lowerCaseQuery,
          },
        }
      );
    }

    // Add filters to the query
    const filterQueries = Object.entries(filters).map(([key, value]) => {
      if (key === "PaymentTier" || key === "LeaveOrNot") {
        return { term: { [key]: parseInt(value) } };
      } else {
        return { term: { [`${key}.keyword`]: value } };
      }
    });

    const response = await axios({
      method: "post",
      url: BASE_URL,
      auth: {
        username: "elastic",
        password: "EsLZx-fCPn16iARqN=Sq",
      },
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        from: page * size,
        size: size,
        query: {
          bool: {
            should: shouldQueries,
            filter: filterQueries,
            minimum_should_match: 1,
          },
        },
      },
    });
    return response.data.hits;
  } catch (error) {
    console.error(
      "Error searching data",
      error.response ? error.response.data : error
    );
    throw error;
  }
};
