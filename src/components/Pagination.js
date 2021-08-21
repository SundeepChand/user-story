import React, { useState, useEffect, useCallback } from 'react'
import {
  EOS_KEYBOARD_ARROW_LEFT,
  EOS_KEYBOARD_ARROW_RIGHT
} from 'eos-icons-react'

const Pagination = (props) => {
  const { page, getPage, storyCount } = props

  const [currNumber, setCurrNumber] = useState(page)

  const updatePage = useCallback(
    (page) => {
      getPage(page)
      setCurrNumber(page)
    },
    [getPage, setCurrNumber]
  )

  const [pages, setPages] = useState(null)

  useEffect(() => {
    setCurrNumber(page)
  }, [page])

  useEffect(() => {
    if (typeof storyCount === typeof 0) {
      const n = Math.ceil(storyCount / 5)
      // if (n <= 0) {
      //   updatePage(1)
      // }
      // else if (page >= n) {
      //   updatePage(n)
      // }
      if (n > 1) {
        setPages([...Array(n + 1).keys()].slice(1))
      } else {
        setPages([1])
      }
    }
  }, [storyCount, updatePage])

  return (
    <div className='pagination'>
      <span
        className={`btn btn-pagination ${
          currNumber <= 1 ? 'btn-pagination-disabled' : ''
        }`}
        onClick={() => {
          if (pages.find((page) => page === currNumber - 1)) {
            updatePage(currNumber - 1)
          }
        }}
      >
        <EOS_KEYBOARD_ARROW_LEFT className='eos-icons eos-18' />
        {`Prev`}
      </span>
      <div className='btn btn-pagination'>
        {pages
          ? pages.map((ele, key) => {
              return (
                <span
                  className={`number ${currNumber === ele ? 'selected' : ''}`}
                  onClick={() => {
                    updatePage(ele)
                  }}
                  key={key}
                >
                  {ele}
                </span>
              )
            })
          : ''}
      </div>
      <span
        className={`btn btn-pagination ${
          currNumber >= pages?.length ? 'btn-pagination-disabled' : ''
        }`}
        onClick={() => {
          if (pages.find((page) => page === currNumber + 1)) {
            updatePage(currNumber + 1)
          }
        }}
      >
        {`Next`}
        <EOS_KEYBOARD_ARROW_RIGHT className='eos-icons eos-18' />
      </span>
    </div>
  )
}

export default Pagination
