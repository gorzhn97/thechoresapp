import { Transform } from 'class-transformer';
import { IsEmail, IsEnum } from 'class-validator';
import { HouseholdRole } from '../households.types';

export class AddHouseholdMemberDto {
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    @IsEmail()
    email!: string;

    @IsEnum(HouseholdRole)
    role!: HouseholdRole;
}