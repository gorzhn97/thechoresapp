import { IsInt, Min } from 'class-validator';

export class CompleteChoreDto {
    @IsInt()
    @Min(1)
    version!: number;
}