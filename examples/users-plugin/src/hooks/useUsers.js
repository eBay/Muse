import {useState, useEffect} from 'react';
import apiClient from '../api';

// const USERS_URL = "https://buluu97.github.io/muse-next-database/mock/users.json";
// need to visit https://cors-anywhere.herokuapp.com/corsdemo  to activate the proxy
const USERS_URL = "https://cors-anywhere.herokuapp.com/https://buluu97.github.io/muse-next-database/mock/users.json";

const useUsers = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading (true);
        setData([]);
        setError(null);

        apiClient.get(USERS_URL)
        .then ((res) => {
            setLoading(false);
            setData(res.data);
        })
        .catch((err) => {
            setLoading(false);
            setError(err);
        });
    }, []);

    return {data, loading, error};
}

export default useUsers;