import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateChoreInstanceDto {
    @IsOptional()
    @IsUUID()
    templateId?: string;

    @IsOptional()
    @IsUUID()
    assignedTo?: string;

    @Type(() => String)
    @IsDateString()
    dueDate!: string;
}