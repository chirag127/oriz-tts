## Program for Recursive Binary & Linear Search for the notes of the Design and Analysis of Algorithm Lab in the subject of Real Time System

### Linear Search
Linear search is a simple search algorithm that checks each element of a list or array until the desired element is found or the end of the list is reached. Here is an example of a recursive linear search function in Python:

```python
def recursive_linear_search(arr, l, r, x):
    if r < l:
        return -1
    if arr[l] == x:
        return l
    if arr[r] == x:
        return r
    return recursive_linear_search(arr, l+1, r-1, x)
```

In this function, `arr` is the list or array being searched, `l` and `r` are the left and right indices of the search range, and `x` is the element being searched for. The function returns the index of the element if it is found, or -1 if it is not found.

### Binary Search
Binary search is a more efficient search algorithm that works on sorted lists or arrays. It repeatedly divides the search range in half until the desired element is found or the search range is empty. Here is an example of a recursive binary search function in Python:

```python
def recursive_binary_search(arr, l, r, x):
    if r >= l:
        mid = l + (r - l) // 2
        if arr[mid] == x:
            return mid
        elif arr[mid] > x:
            return recursive_binary_search(arr, l, mid-1, x)
        else:
            return recursive_binary_search(arr, mid+1, r, x)
    else:
        return -1
```

In this function, `arr` is the sorted list or array being searched, `l` and `r` are the left and right indices of the search range, and `x` is the element being searched for. The function returns the index of the element if it is found, or -1 if it is not found.

Both linear and binary search can be implemented recursively, as shown in the examples above. The choice of which algorithm to use depends on the specific use case and the characteristics of the data being searched. In general, binary search is more efficient for large, sorted data sets, while linear search may be more suitable for small or unsorted data sets.