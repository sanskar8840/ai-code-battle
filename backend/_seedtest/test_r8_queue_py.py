import sys

def solve():
    lines = sys.stdin.read().splitlines()
    q = int(lines[0])
    ops = lines[1:1 + q]
    # TODO: maintain a queue; for each "pop"/"peek" op, print the result on its own line.

if __name__ == "__main__":
    solve()
