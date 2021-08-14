import React, { useState, useEffect } from 'react'

import { CheckBox, RadioButton } from './InputButtons'
import SearchInput from '../modules/SearchInput'
import Lists from '../utils/Lists'
import userStory from '../services/user_story'

const SearchBar = (props) => {
  const {
    sort,
    setSort,
    setSearchQuery,
    setAuthorQuery,
    setPage,
    selectedStatuses,
    setSelectedStatuses,
    selectedCategories,
    setSelectedCategories
  } = props

  const [categories, setCategories] = useState([])

  const [filtersOpened, setFiltersOpened] = useState(false)

  const toggleFilters = (filters, setFilters, value) => () => {
    if (filters.find((filter) => filter === value)) {
      setFilters(filters.filter((filter) => filter !== value))
    } else {
      setFilters(filters.concat(value))
    }
    setPage(1)
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
          <i className='eos-icons'>keyboard_arrow_up</i>
        ) : (
          <i className='eos-icons'>keyboard_arrow_down</i>
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
                        selectedStatuses,
                        setSelectedStatuses,
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
                      selectedCategories,
                      setSelectedCategories,
                      category
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className='filter-container filter-container-sort'>
            <p>Sort By</p>
            <div className='filter-section'>
              {Lists.sortByList.map((item, key) => (
                <div key={key}>
                  <RadioButton
                    id={item}
                    checked={sort === item}
                    onChange={() => {
                      setSort(item)
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
