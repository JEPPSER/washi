require "files"
require "strings"

function get_loop(line)
    loop = {}
    local is_for_loop = string.match(line, "for[%s]*%(let[%s]+[%g]+[%s]+of[%s]+[%g]+%)[%s]*{")
    if is_for_loop then
        loop.value_key = string.match(line, "for[%s]*%(let[%s]+([%g]+)[%s]+of[%s]+[%g]+%)[%s]*{")
        loop.list_key = string.match(line, "for[%s]*%(let[%s]+[%g]+[%s]+of[%s]+([%g]+)%)[%s]*{")
    end
    return loop
end

function get_loop_content(lines, start_index)
    local content = {}
    local index = 1
    for i = start_index, #lines do
        local trimmed = string.gsub(lines[i], "%s+", "")
        if trimmed == "}" then
            return table.concat(content, "\n")
        else
            content[index] = trim(lines[i])
            index = index + 1
        end
    end
end

function parse_for_loops(html)
    lines = split(html, "\n")
    for k, v in pairs(lines) do
        local loop = get_loop(v)
        if loop.list_key then
            loop.html = get_loop_content(lines, k + 1)
            loop.id = random_string(7)

            print(loop.html)
            print(loop.id)
            print(loop.list_key)
            print(loop.value_key)
        end
    end
end

local file = 'washi.config'
local lines = lines_from(file)

components = {}

for k, v in pairs(lines) do
    parts = split(v, " ")
    components[k] = { html = parts[1], js = parts[2] }
end

for k, v in pairs(components) do
    js = read_all(v.js)
    html = read_all(v.html)

    loops = {}
    ifs = {}

    parse_for_loops(html)
end