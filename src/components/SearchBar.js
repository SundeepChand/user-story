import React, { useState, useEffect } from 'react'
import { EOS_KEYBOARD_ARROW_UP, EOS_KEYBOARD_ARROW_DOWN } from 'eos-icons-react'
import { CheckBox, RadioButton } from './InputButtons'
import SearchInput from '../modules/SearchInput'
import Lists from '../utils/Lists'
import userStory from '../services/user_story'

const SearchBar = (props) => {
  const {
    setSearchQuery,
    setAuthorQuery,
    searchFilters,
    setSearchFilters
  } = props

  const {
    statuses: selectedStatuses,
    categories: selectedCategories
  } = searchFilters

  const [categories, setCategories] = useState([])

  const [filtersOpened, setFiltersOpened] = useState(false)

  const toggleFilters = (name, filters, value) => () => {
    const newFiltersObject = Object.assign({ ...searchFilters }, { page: 1 })
    if (filters.find((filter) => filter === value)) {
      newFiltersObject[name] = filters.filter((filter) => filter !== value)
    } else {
      newFiltersObject[name] = filters.concat(value)
    }
    setSearchFilters(newFiltersObject)
  }

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await userStory.getCategories()
      setCategories(
        response.data.data.__type.enumValues.map((ele) => {
          return ele.name
        })
      )
    }
    fetchCategories()
  }, [])

  return (
    <div className='flex flex-row search-bar'>
      <SearchInput
        setSearchQuery={setSearchQuery}
        setAuthorQuery={setAuthorQuery}
      />

      <label
        data-cy='toggle-filters'
        onClick={() => {
          setFiltersOpened(!filtersOpened)
        }}
      >
        {filtersOpened ? 'Hide ' : 'Show '}
        Filters{' '}
        {filtersOpened ? (
          <EOS_KEYBOARD_ARROW_UP className='eos-icons' />
        ) : (
          <EOS_KEYBOARD_ARROW_DOWN className='eos-icons' />
        )}
      </label>

      {filtersOpened && (
        <div className='search-filters' data-cy='search-filters'>
          <div className='filter-container filter-container-status'>
            <p>Stages</p>
            <div className='filter-section'>
              {Lists.stateList.map((state, key) => {
                return (
                  <span className='checkbox-row' key={key}>
                    <CheckBox
                      onChange={toggleFilters(
                        'statuses',
                        selectedStatuses,
                        state.status
                      )}
                      id={state.status}
                      icon={state.icon}
                      checked={
                        !!selectedStatuses.find(
                          (status) => status === state.status
                        )
                      }
                    />
                  </span>
                )
              })}
            </div>
            <label
              className='link link-default'
              onClick={() => {
                const newFiltersObject = Object.assign(
                  { ...searchFilters },
                  { page: 1 }
                )
                if (selectedStatuses.length < Lists.stateList.length) {
                  const newStatuses = Lists.stateList.map(
                    (state) => state.status
                  )
                  newFiltersObject.statuses = newStatuses
                } else {
                  newFiltersObject.statuses = []
                }
                setSearchFilters(newFiltersObject)
              }}
            >
              {selectedStatuses.length === Lists.stateList.length
                ? 'Clear'
                : 'Select'}{' '}
              All
            </label>
          </div>

          <div className='filter-container filter-container-category'>
            <p>Categories</p>
            <div className='filter-section' data-cy='filter-section-category'>
              {categories.map((category, key) => (
                <div className='checkbox-row' key={key}>
                  <CheckBox
                    id={category}
                    checked={!!selectedCategories.find((c) => c === category)}
                    onChange={toggleFilters(
                      'categories',
                      selectedCategories,
                      category
                    )}
                  />
                </div>
              ))}
            </div>
            <label
              className='link link-default'
              onClick={() => {
                const newFiltersObject = Object.assign(
                  { ...searchFilters },
                  { page: 1 }
                )
                if (selectedCategories.length < categories.length) {
                  newFiltersObject.categories = categories
                } else {
                  newFiltersObject.categories = []
                }
                setSearchFilters(newFiltersObject)
              }}
            >
              {selectedCategories.length === categories.length
                ? 'Clear'
                : 'Select'}{' '}
              All
            </label>
          </div>

          <div className='filter-container filter-container-sort'>
            <p>Sort By</p>
            <div className='filter-section'>
              {Lists.sortByList.map((item, key) => (
                <div key={key}>
                  <RadioButton
                    id={item}
                    checked={searchFilters.sort === item}
                    onChange={() => {
                      const newSearchFilters = Object.assign({}, searchFilters)
                      newSearchFilters.sort = item
                      setSearchFilters(newSearchFilters)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
