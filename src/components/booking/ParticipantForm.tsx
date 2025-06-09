
import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { translations } from '../../utils/translations';
import { COUNTRIES } from '../../utils/constants';

interface Participant {
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  nationality: string;
}

interface ParticipantFormProps {
  participant: Participant;
  index: number;
  participantsCount: number;
  relationship: string;
  onUpdate: (index: number, field: keyof Participant, value: string) => void;
  errors: any;
}

const ParticipantForm: React.FC<ParticipantFormProps> = ({
  participant,
  index,
  participantsCount,
  relationship,
  onUpdate,
  errors
}) => {
  const { language } = useLanguage();
  const t = translations[language];

  const getParticipantTitle = () => {
    if (participantsCount === 1) return t.participant;
    if (participantsCount === 2 && relationship === 'couple') {
      return index === 0 ? t.husband : t.wife;
    }
    return `${t.participant} ${index + 1}`;
  };

  return (
    <div className="mb-8 p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        {getParticipantTitle()}
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.name}
          </label>
          <input
            type="text"
            value={participant.name}
            onChange={(e) => onUpdate(index, 'name', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors[`participant_${index}_name`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`participant_${index}_name`]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.birthDate}
          </label>
          <input
            type="date"
            value={participant.birthDate}
            onChange={(e) => onUpdate(index, 'birthDate', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors[`participant_${index}_birthDate`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`participant_${index}_birthDate`]}</p>
          )}
          {errors[`participant_${index}_age`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`participant_${index}_age`]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.gender}
          </label>
          <select
            value={participant.gender}
            onChange={(e) => onUpdate(index, 'gender', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={participantsCount === 2 && relationship === 'couple'}
          >
            <option value="male">{t.male}</option>
            <option value="female">{t.female}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.nationality}
          </label>
          <select
            value={participant.nationality}
            onChange={(e) => onUpdate(index, 'nationality', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">{t.nationality}</option>
            {COUNTRIES.map(country => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name[language]}
              </option>
            ))}
          </select>
          {errors[`participant_${index}_nationality`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`participant_${index}_nationality`]}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantForm;
