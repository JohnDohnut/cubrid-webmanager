export class UserPreferenceDto {
    dashboardInterval?: number;
    brokerStatusInterval?: number;
}

export class UpdateUserDto {
    department?: string;
    user_preference?: UserPreferenceDto;
}