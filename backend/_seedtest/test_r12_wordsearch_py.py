import sys

def solve():
    data = sys.stdin.read().split()
    idx = 0
    r, c = int(data[idx]), int(data[idx + 1]); idx += 2
    grid = data[idx:idx + r]; idx += r
    word = data[idx]

    # TODO: implement your solution using grid and word
    print("false")

if __name__ == "__main__":
    solve()
