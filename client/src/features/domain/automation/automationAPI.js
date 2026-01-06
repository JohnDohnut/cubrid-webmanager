import {getResponse} from "@/api/endPoint.js";

export const getQueryPlanAPI = async (host, data) => {
    let payload = {
        task: "getautoexecquery",
        ...data
    }

    const url = `/${host.uid}/`;
    const response = await getResponse(server, payload)
    return {result: response.planlist?.[0]?.queryplan, success: response.success};
}