import Dashboard from "../features/dashboard/Dashboard.jsx";
import SpaceInfo from "@/features/sidenav/components/contents/SpaceInfo.jsx";
import CubridConfig from "@/features/appbar/components/contents/CubridConfig.jsx";
import BrokerConfig from "@/features/appbar/components/contents/BrokerConfig.jsx";
import CMConfig from "@/features/appbar/components/contents/CMConfig.jsx";
import SQLLogTable from "@/features/sidenav/components/contents/log/SQLLogTable.jsx";
import LogBrokerErrorTable from "@/features/sidenav/components/contents/log/LogBrokerErrorTable.jsx";
import LogAdminTable from "@/features/sidenav/components/contents/log/LogAdminTable.jsx";
import LogManagerAccessTable from "@/features/sidenav/components/contents/log/LogManagerAccessTable.jsx";
import LogManagerErrorTable from "@/features/sidenav/components/contents/log/LogManagerErrorTable.jsx";
import LogServerErrorTable from "@/features/sidenav/components/contents/log/LogServerErrorTable.jsx";
import BrokerStatus from "@/features/sidenav/components/contents/broker/BrokerStatus.jsx";
import SQLEditor from "@/components/common/editor/SQLEditor.jsx";

export const TAB_SCREEN = {
    "host":  Dashboard,
    "space_info": SpaceInfo,
    "cubrid_config": CubridConfig,
    "broker_config": BrokerConfig,
    "cm_config": CMConfig,
    "broker_sql_log": SQLLogTable,
    "log_broker_error": LogBrokerErrorTable,
    "log_admin": LogAdminTable,
    "log_manager_access": LogManagerAccessTable,
    "log_manager_error": LogManagerErrorTable,
    "log_server_error": LogServerErrorTable,
    "broker": BrokerStatus,
    "sql_editor": SQLEditor,
}
