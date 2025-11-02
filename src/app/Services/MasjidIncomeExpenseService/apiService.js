

export const fetchMasjidIncomeExpensesData = async () => {
    try {
      const response = await fetch(`https://api.noorimasjidghanghori.com/GetIncomeExpenseData`);
      if (!response.ok) {
        throw new Error('Failed to fetch data from the server.');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  };
  