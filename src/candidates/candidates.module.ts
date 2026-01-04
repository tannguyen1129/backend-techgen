import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <-- QUAN TRỌNG
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { Candidate } from './entities/candidate.entity'; // <-- Import đúng đường dẫn Entity

@Module({
  imports: [
    // BẮT BUỘC PHẢI CÓ DÒNG NÀY để tiêm Repository vào Service
    TypeOrmModule.forFeature([Candidate]), 
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [CandidatesService],
})
export class CandidatesModule {}