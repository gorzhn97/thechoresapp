import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateChoreTemplateDto {
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    estimatedMinutes?: number;

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @MaxLength(120)
    recurrenceRule?: string;
}