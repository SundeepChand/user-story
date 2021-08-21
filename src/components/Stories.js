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

const initSearchFilters = (queryString) => {
  const searchFilters = parse(queryString, { arrayFormat: 'bracket' })
  if (typeof searchFilters.statuses === typeof undefined) {
    searchFilters.statuses = []
  }
  if (typeof searchFilters.categories === typeof undefined) {
    searchFilters.categories = []
  }
  if (typeof searchFilters.sort === typeof undefined) {
    searchFilters.sort = 'Most Voted'
  }
  const initialPage = Number(searchFilters.page)
  searchFilters.page = isNaN(initialPage) || initialPage <= 0 ? 1 : initialPage
  return searchFilters
}

const pruneDefaultValues = (searchFilters) => {
  if (searchFilters.page === 1) {
    searchFilters.page = undefined
  }
  if (searchFilters.sort === 'Most Voted') {
    searchFilters.sort = undefined
  }
  return searchFilters
}

const Stories = ({ authorId, followerId }) => {
  const location = useLocation()

  const [searchFilters, setSearchFilters] = useState(
    initSearchFilters(location.search)
  )

  const { promiseInProgress } = usePromiseTracker({ area: 'stories-div' })

  const [storyCount, setStoryCount] = useState()

  const [stories, setStories] = useState([])

  const [productQuery, setProductQuery] = useState(``)

  const [searchQuery, setSearchQuery] = useState('')

  const [authorQuery, setAuthorQuery] = useState('')

  const countCancelToken = useRef()

  const storiesCancelToken = useRef()

  const getPage = useCallback(
    (page) => {
      const newFiltersObject = Object.assign({ ...searchFilters }, { page })
      setSearchFilters(newFiltersObject)
    },
    [searchFilters]
  )

  useEffect(() => {
    const filtersString = stringify(
      pruneDefaultValues(Object.assign({}, searchFilters)),
      {
        arrayFormat: 'bracket',
        skipEmptyString: true
      }
    )
    if (filtersString === '') {
      navigate(location.pathname)
      return
    }
    navigate(`${location.pathname}?${filtersString}`)
  }, [searchFilters, location.pathname])

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
          searchFilters.statuses,
          authorId,
          authorQuery,
          searchFilters.categories,
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
    searchFilters.statuses,
    searchFilters.categories,
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
          searchFilters.page,
          searchFilters.statuses,
          authorId,
          authorQuery,
          searchFilters.categories,
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
    searchFilters.categories,
    searchFilters.statuses,
    searchFilters.page,
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
      if (searchFilters.sort === 'Most Voted') {
        setStories(stories.sort(comparatorVotes))
      }
      if (searchFilters.sort === 'Most Discussed') {
        setStories(stories.sort(comparatorComments))
      }
    }
    trackPromise(updateStories(), 'stories-div')
  }, [searchFilters.sort, stories])

  return (
    <>
      <ProductList
        setProductQuery={setProductQuery}
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
      />

      <SearchBar
        setSearchQuery={setSearchQuery}
        setAuthorQuery={setAuthorQuery}
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
      />

      <div className='stories-div'>
        <StoriesList stories={stories} isLoading={promiseInProgress} />
      </div>
      <Pagination
        page={searchFilters.page}
        getPage={getPage}
        storyCount={storyCount}
      />
    </>
  )
}

export default Stories
