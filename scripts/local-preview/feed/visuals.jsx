import React from 'react';

const postDateFormat = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
});

export function formatPostDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return postDateFormat.format(date).replace(/\bAM\b/g, '오전').replace(/\bPM\b/g, '오후');
}

export function FeedAvatar({className = '', ...imageProps}) {
    const shape = className.split(/\s+/).filter(name => name && name !== 'border' && !name.startsWith('border-'));
    return <span className={['studio-feed-avatar', ...shape].join(' ')}>
        <img {...imageProps} />
    </span>;
}

export function FeedColumnFilter({label, options, value, onChange}) {
    const selection = options.find(option => option.value === value);
    return <span className="studio-feed-column-filter">
        <select aria-label={label + ' 필터'} title={selection?.label || label + ' 필터'}
            value={value} onChange={event => onChange(event.target.value)}>
            <option value="">{value ? '전체' : label}</option>
            {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
    </span>;
}
