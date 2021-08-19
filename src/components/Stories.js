import React, { useState, useEffect, useCallback, useRef } from 'react'
import { trackPromise, usePromiseTracker } from 'react-promise-tracker'
import { parse, stringify } from 'query-string'
import { navigate, useLocation } from '@reach/router'
import axios from 'axios'

import StoriesList from './StoriesList'
import Pagination from './Pagination'
import SearchBar from './SearchBar'
import ProductList from './ProductList'
import userStory from '../services/user_story'

const Stories = ({ authorId, followerId }) => {
  const location = useLocation()

  const filters = parse(location.search, { arrayFormat: 'bracket' })

  const [searchFilters, setSearchFilters] = useState(filters ?? {})

  const [selectedStatuses, setSelectedStatuses] = useState(
    searchFilters.statuses ?? []
  )

  const [page, setPage] = useState(1)

  const [sort, setSort] = useState('Most Voted')

  const [selectedCategories, setSelectedCategories] = useState(
    searchFilters.categories ?? []
  )

  const { promiseInProgress } = usePromiseTracker({ area: 'stories-div' })

  const [storyCount, setStoryCount] = useState()

  const [stories, setStories] = useState([])

  const [productQuery, setProductQuery] = useState(``)

  const [searchQuery, setSearchQuery] = useState('')

  const [authorQuery, setAuthorQuery] = useState('')

  const countCancelToken = useRef()

  const storiesCancelToken = useRef()

  const getPage = useCallback((page) => {
    setPage(page)
  }, [])

  useEffect(() => {
    const filtersString = stringify(searchFilters, {
      arrayFormat: 'bracket',
      skipEmptyString: true
    })
    if (filtersString === '') {
      navigate(location.pathname)
      return
    }
    navigate(`${location.pathname}?${filtersString}`)
  }, [
    searchFilters,
    searchFilters.statuses,
    searchFilters.categories,
    searchFilters.product,
    location.pathname
  ])

  useEffect(() => {
    const fetchStoryCount = async () => {
      if (typeof countCancelToken.current !== typeof undefined) {
        countCancelToken.current.cancel(
          'Cancelling fetch story count as another call to fetch story count is made'
        )
      }

      countCancelToken.current = axios.CancelToken.source()

      try {
        const response = await userStory.getStoryCount(
          selectedStatuses,
          authorId,
          authorQuery,
          selectedCategories,
          productQuery,
          searchQuery,
          followerId,
          countCancelToken.current.token
        )
        setStoryCount(response.data.data.userStoriesConnection.aggregate.count)
      } catch (e) {}
    }
    fetchStoryCount()
  }, [
    selectedStatuses,
    selectedCategories,
    productQuery,
    searchQuery,
    authorQuery,
    authorId,
    followerId
  ])

  useEffect(() => {
    const fetchStories = async () => {
      if (typeof storiesCancelToken.current !== typeof undefined) {
        storiesCancelToken.current.cancel(
          'Cancelling fetch story as another call to fetch story is made'
        )
      }

      storiesCancelToken.current = axios.CancelToken.source()

      try {
        const response = await userStory.getStories(
          page,
          selectedStatuses,
          authorId,
          authorQuery,
          selectedCategories,
          productQuery,
          searchQuery,
          followerId,
          storiesCancelToken.current.token
        )

        setStories(response.data.data.userStories)
      } catch (e) {}
    }
    trackPromise(fetchStories(), 'stories-div')
  }, [
    selectedCategories,
    selectedStatuses,
    page,
    productQuery,
    searchQuery,
    authorQuery,
    authorId,
    followerId
  ])

  useEffect(() => {
    const comparatorVotes = (a, b) => {
      return a.followers.length > b.followers.length ? -1 : 1
    }
    const comparatorComments = (a, b) => {
      return a.user_story_comments.length > b.user_story_comments.length
        ? -1
        : 1
    }

    const updateStories = async () => {
      if (sort === 'Most Voted') {
        setStories(stories.sort(comparatorVotes))
      }
      if (sort === 'Most Discussed') {
        setStories(stories.sort(comparatorComments))
      }
    }
    trackPromise(updateStories(), 'stories-div')
  }, [sort, stories, setStories])

  return (
    <>
      <ProductList
        setProductQuery={setProductQuery}
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
      />

      <SearchBar
        sort={sort}
        setSort={setSort}
        setSearchQuery={setSearchQuery}
        setAuthorQuery={setAuthorQuery}
        setPage={setPage}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
      />

      <div className='stories-div'>
        <StoriesList stories={stories} isLoading={promiseInProgress} />
      </div>
      <Pagination
        getPage={getPage}
        storyCount={storyCount}
        status={selectedStatuses}
        productQuery={productQuery}
      />
    </>
  )
}

export default Stories
