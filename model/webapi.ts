import { axios } from "../api";
export const apiUrl = 'http://tj.mzswebs.top';
export const apiUrl2 = `http://yiyan-api.mzswebs.top/yiyan.php`
export async function fetchData(apiUrl: string): Promise<any> {
    try {
        const response = await axios.get(apiUrl);
        const data = response.data;
        return data;
    } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
    }
}
