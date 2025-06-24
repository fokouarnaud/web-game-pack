package com.dialectgame.service.mapper;

import com.dialectgame.model.dto.lesson.LessonDto;
import com.dialectgame.model.dto.lesson.LessonContentDto;
import com.dialectgame.model.entity.Lesson;
import com.dialectgame.model.entity.LessonContent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LessonMapper {

    @Mapping(target = "content", ignore = true)
    LessonDto toDto(Lesson lesson);

    @Mapping(target = "content", source = "content")
    LessonDto toDtoWithContent(Lesson lesson);

    LessonContentDto toContentDto(LessonContent content);

    @Mapping(target = "userProgress", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Lesson toEntity(LessonDto lessonDto);
}