import { API_URL } from "../config";

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
    // Ajoutez ici d'autres headers si nécessaire (ex: Authorization)
  };
};

export const fetchItems = async () => {
  try {
    const response = await fetch(`${API_URL}/items/`, {
      method: "GET",
      headers: getHeaders(),
    });

    const responseData = await response.text();
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${responseData}`);
    }

    // Only parse as JSON if we have content
    return responseData ? JSON.parse(responseData) : null;
  } catch (error) {
    console.error("Error fetching items:", {
      message: error.message,
    });
    return [];
  }
};

export const createItem = async (item) => {
  try {
    console.log('Creating item with data:', item);
    
    const response = await fetch(`${API_URL}/items/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(item),
    });

    const responseData = await response.text();
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${responseData}`);
    }

    // Only parse as JSON if we have content
    return responseData ? JSON.parse(responseData) : null;
  } catch (error) {
    console.error("Error creating item:", {
      message: error.message,
      item: item
    });
    throw error;
  }
};

export const updateItem = async (id, item) => {
  try {
    const response = await fetch(`${API_URL}/items/${id}/`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(item),
    });

    const responseData = await response.text();
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${responseData}`);
    }

    // Only parse as JSON if we have content
    return responseData ? JSON.parse(responseData) : null;
  } catch (error) {
    console.error("Error updating item:", {
      message: error.message,
      id: id,
      item: item
    });
    throw error;
  }
};

export const deleteItem = async (id) => {
  try {
    const response = await fetch(`${API_URL}/items/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    const responseData = await response.text();
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${responseData}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting item:", {
      message: error.message,
      id: id
    });
    throw error;
  }
};
