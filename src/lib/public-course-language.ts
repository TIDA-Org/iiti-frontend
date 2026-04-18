import {
  type CourseApiResponse,
  type CourseCategoryApiResponse,
  type CourseDetailApiResponse,
  type CourseDurationOptionApiResponse,
  type TrainingLocationApiResponse,
} from '@/lib/api/courses'

export type CourseLanguage = 'en' | 'si'

export const COURSE_LANGUAGE_STORAGE_KEY = 'public-course-language'
export const COURSE_LANGUAGE_QUERY_PARAM = 'lang'

export const COURSE_COPY = {
  en: {
    language: 'Language',
    catalogueLabel: 'Our Programmes',
    catalogueTitle: 'All Training Programmes',
    catalogueDescription:
      'Browse all live courses from the institute system, including full programmes, package options, and one-day certification routes.',
    loadingCourses: 'Loading courses...',
    retry: 'Retry',
    professionalTraining: 'Professional Training',
    tvecRegistered: 'TVEC Registered',
    duration: 'Duration',
    instituteCertificate: 'Institute Certificate',
    skillIdCard: 'Skill ID Card',
    nvqCertificate: 'NVQ Level 3 Certificate',
    programmeCompletionRecord: 'Programme Completion Record',
    courseFee: 'Course Fee',
    learnMore: 'Learn More',
    applyNow: 'Apply Now',
    noActiveCourses: 'No active courses are available right now.',
    home: 'Home',
    courses: 'Courses',
    trialRoute: 'Trial Route',
    fullProgramme: 'Full Programme',
    courseOverview: 'Course Overview',
    trainingDetails: 'Training Details',
    programmeBrief: 'Programme Brief',
    courseRoadmap: 'Course Roadmap',
    keyTopics: 'Key Topics',
    keyTopicsDescription: 'Use these highlights to scan the training structure before reading the full curriculum.',
    deliveryFormat: 'Delivery Format',
    studyOptions: 'Study Options',
    activeLocations: 'Active Locations',
    certificationOutcomes: 'Certification & Outcomes',
    practicalFocus: 'Practical, assessment-ready operator training',
    courseCode: 'Course Code',
    detailsFallback:
      'Detailed curriculum information will be published here soon. Contact the institute for the latest intake details and schedule.',
    availableDurations: 'Available Durations',
    durationFallback: 'Duration options are being updated. Contact us for the latest intake structure.',
    certificatesYouReceive: 'Certificates You Receive',
    instituteCertificateDesc: 'Officially issued by IITI',
    skillIdCardDesc: 'Identity and training verification support',
    nvqCertification: 'NVQ Certification',
    nvqPathwayAvailable: 'TVEC-linked pathway available',
    subjectToPathway: 'Subject to course pathway',
    category: 'Category',
    installments: 'Installments',
    notAvailable: 'Not available',
    trainingProgramme: 'Training Programme',
    admissionNote: 'Admission and certificate charges may apply separately.',
    applyForCourse: 'Apply for This Course',
    askQuestion: 'Ask a Question',
    trainingLocations: 'Training Locations',
    locationFallback: 'Location details are being updated. Contact the office for venue confirmation.',
    needHelp: 'Need Help?',
    helpCopy: 'Call {phone} or use the contact page for intake dates, payment guidance, and enrollment support.',
    contactForSchedule: 'Contact us for schedule details',
    liveFromApi: 'Live from API',
  },
  si: {
    language: 'භාෂාව',
    catalogueLabel: 'අපගේ පාඨමාලා',
    catalogueTitle: 'සියලුම පුහුණු පාඨමාලා',
    catalogueDescription:
      'සම්පූර්ණ පාඨමාලා, පැකේජ වැඩසටහන් සහ එක්දින සහතික මාර්ග ඇතුළුව ආයතන පද්ධතියෙන් සජීවීව ලබාගන්නා සියලුම පාඨමාලා නරඹන්න.',
    loadingCourses: 'පාඨමාලා පූරණය වෙමින්...',
    retry: 'නැවත උත්සාහ කරන්න',
    professionalTraining: 'වෘත්තීය පුහුණුව',
    tvecRegistered: 'TVEC ලියාපදිංචි',
    duration: 'කාලසීමාව',
    instituteCertificate: 'ආයතන සහතිකය',
    skillIdCard: 'කුසලතා හැඳුනුම්පත',
    nvqCertificate: 'NVQ 3 මට්ටමේ සහතිකය',
    programmeCompletionRecord: 'වැඩසටහන් සම්පූර්ණ කිරීමේ වාර්තාව',
    courseFee: 'පාඨමාලා ගාස්තුව',
    learnMore: 'වැඩිදුර බලන්න',
    applyNow: 'දැන් අයදුම් කරන්න',
    noActiveCourses: 'දැනට සක්‍රීය පාඨමාලා නොමැත.',
    home: 'මුල් පිටුව',
    courses: 'පාඨමාලා',
    trialRoute: 'පරීක්ෂණ මාර්ගය',
    fullProgramme: 'සම්පූර්ණ පාඨමාලාව',
    courseOverview: 'පාඨමාලා සාරාංශය',
    trainingDetails: 'පුහුණු විස්තර',
    programmeBrief: 'වැඩසටහන් සාරාංශය',
    courseRoadmap: 'පාඨමාලා මාර්ගසටහන',
    keyTopics: 'ප්‍රධාන මාතෘකා',
    keyTopicsDescription: 'සම්පූර්ණ පාඨමාලා විස්තරය කියවීමට පෙර පුහුණු ව්‍යුහය ඉක්මනින් අවබෝධ කර ගැනීමට මෙම අයිතම භාවිත කරන්න.',
    deliveryFormat: 'පවත්වාගෙන යන ආකාරය',
    studyOptions: 'ඉගෙනුම් විකල්ප',
    activeLocations: 'සක්‍රීය ස්ථාන',
    certificationOutcomes: 'සහතික සහ ප්‍රතිඵල',
    practicalFocus: 'ප්‍රායෝගික සහ ඇගයීම්-සූදානම් ක්‍රියාකරු පුහුණුව',
    courseCode: 'පාඨමාලා කේතය',
    detailsFallback:
      'සවිස්තරාත්මක පාඨමාලා තොරතුරු ඉදිරියේදී මෙහි පළ කෙරේ. නවතම කණ්ඩායම් සහ කාලසටහන් සඳහා ආයතනය අමතන්න.',
    availableDurations: 'ලබාගත හැකි කාලසීමා',
    durationFallback: 'කාලසීමා තොරතුරු යාවත්කාලීන වෙමින් පවතී. නවතම කණ්ඩායම් රටාව සඳහා අප අමතන්න.',
    certificatesYouReceive: 'ඔබට ලැබෙන සහතික',
    instituteCertificateDesc: 'IITI මගින් නිල වශයෙන් නිකුත් කෙරේ',
    skillIdCardDesc: 'හැඳුනුම් සහ පුහුණු සනාථ කිරීම සඳහා',
    nvqCertification: 'NVQ සහතිකය',
    nvqPathwayAvailable: 'TVEC සම්බන්ධිත මාර්ගය ලබා ගත හැක',
    subjectToPathway: 'පාඨමාලා මාර්ගය අනුව වෙනස් වේ',
    category: 'කාණ්ඩය',
    installments: 'වාරික',
    notAvailable: 'නොමැත',
    trainingProgramme: 'පුහුණු පාඨමාලාව',
    admissionNote: 'ඇතුළත් වීමේ සහ සහතික ගාස්තු වෙනම අය විය හැක.',
    applyForCourse: 'මෙම පාඨමාලාව සඳහා අයදුම් කරන්න',
    askQuestion: 'ප්‍රශ්නයක් අසන්න',
    trainingLocations: 'පුහුණු ස්ථාන',
    locationFallback: 'ස්ථාන තොරතුරු යාවත්කාලීන වෙමින් පවතී. තහවුරු කිරීම සඳහා කාර්යාලය අමතන්න.',
    needHelp: 'උදව් අවශ්‍යද?',
    helpCopy: 'බැච් දින, ගෙවීම් මාර්ගෝපදේශ සහ ලියාපදිංචි සහාය සඳහා {phone} අමතන්න හෝ සම්බන්ධතා පිටුව භාවිත කරන්න.',
    contactForSchedule: 'කාලසටහන් තොරතුරු සඳහා අප අමතන්න',
    liveFromApi: 'API හරහා සජීවී',
  },
} as const

export function isCourseLanguage(value: string | null | undefined): value is CourseLanguage {
  return value === 'en' || value === 'si'
}

export function getCourseLanguageHref(path: string, lang: CourseLanguage) {
  if (lang === 'en') return path
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}${COURSE_LANGUAGE_QUERY_PARAM}=${lang}`
}

export function getCourseTextClass(lang: CourseLanguage) {
  return lang === 'si' ? 'font-sinhala' : ''
}

export function getLocalizedText(
  lang: CourseLanguage,
  english: string | null | undefined,
  sinhala: string | null | undefined,
  fallback: string,
) {
  if (lang === 'si') {
    return sinhala?.trim() || english?.trim() || fallback
  }

  return english?.trim() || sinhala?.trim() || fallback
}

export function getLocalizedCourseName(course: CourseApiResponse | CourseDetailApiResponse, lang: CourseLanguage) {
  return getLocalizedText(lang, course.name, course.name_si, course.course_code)
}

export function getLocalizedCourseDescription(course: CourseApiResponse | CourseDetailApiResponse, lang: CourseLanguage, fallback: string) {
  return getLocalizedText(lang, course.description, course.description_si, fallback)
}

export function getLocalizedCourseDetails(course: CourseDetailApiResponse, lang: CourseLanguage) {
  return getLocalizedText(lang, course.full_details, course.full_details_si, '')
}

export function getLocalizedCategoryName(category: CourseCategoryApiResponse | null | undefined, lang: CourseLanguage, fallback: string) {
  return getLocalizedText(lang, category?.name, category?.name_si, fallback)
}

export function getLocalizedLocationName(location: TrainingLocationApiResponse, lang: CourseLanguage) {
  return getLocalizedText(lang, location.name, location.name_si, location.name)
}

function getSinhalaDurationUnit(unit: string) {
  const normalized = unit.trim().toLowerCase()
  if (normalized === 'day' || normalized === 'days') return 'දින'
  if (normalized === 'week' || normalized === 'weeks') return 'සති'
  if (normalized === 'month' || normalized === 'months') return 'මාස'
  if (normalized === 'hour' || normalized === 'hours') return 'පැය'
  return unit
}

export function getLocalizedDurationLabel(option: CourseDurationOptionApiResponse, lang: CourseLanguage) {
  const normalizedUnit = option.duration_unit.endsWith('s') ? option.duration_unit : `${option.duration_unit}s`
  const englishFallback = `${option.duration_value} ${normalizedUnit}`
  const sinhalaFallback = `${option.duration_value} ${getSinhalaDurationUnit(normalizedUnit)}`

  return getLocalizedText(lang, option.label || englishFallback, option.label_si || sinhalaFallback, englishFallback)
}

export function getLocalizedDurationSummary(course: CourseDetailApiResponse, lang: CourseLanguage, contactFallback: string) {
  const availableDurations = course.duration_options.filter((option) => option.is_available)
  if (availableDurations.length === 0) return contactFallback

  return availableDurations.map((option) => getLocalizedDurationLabel(option, lang)).join(' / ')
}

export function getLocalizedCourseTypeLabel(course: CourseApiResponse | CourseDetailApiResponse, lang: CourseLanguage) {
  return course.course_type === 'trial_course' ? COURSE_COPY[lang].trialRoute : COURSE_COPY[lang].fullProgramme
}
