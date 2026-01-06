import axios from "axios";


const useFetch = ()=>{

    const requestPost =async (path, data) => {
        const response = await axios.post(path, data)
        if (response.status === 200) {}
    }

}

export default useFetch