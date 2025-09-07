// apiService.js
export const fetchMasjidCommitteeData = async () => {
    try {
      const response = await fetch('https://localhost:7140/api/MasjidCommittee');
      if (!response.ok) {
        throw new Error('Failed to fetch data from the server.');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  };
  